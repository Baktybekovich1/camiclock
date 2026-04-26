<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Plan;
use App\Repository\CategoryRepository;
use App\Repository\PlanRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/plans')]
class PlanController extends ApiController
{
    public function __construct(
        private readonly PlanRepository $planRepository,
        private readonly CategoryRepository $categoryRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('', name: 'api_plans_list', methods: ['GET'])]
    public function list(Request $request)
    {
        $periodType = $this->normalizePeriodType((string) $request->query->get('periodType', Plan::PERIOD_DAY));
        $periodStart = $this->resolvePeriodStart($periodType, (string) $request->query->get('periodStart', ''));

        $plans = $this->planRepository->findByUserAndPeriod($this->currentUser(), $periodType, $periodStart);

        $result = array_map(static fn (Plan $plan): array => [
            'id' => $plan->getId(),
            'categoryId' => $plan->getCategory()->getId(),
            'categoryName' => $plan->getCategory()->getName(),
            'categoryColor' => $plan->getCategory()->getColor(),
            'periodType' => $plan->getPeriodType(),
            'periodStart' => $plan->getPeriodStart()->format('Y-m-d'),
            'targetMinutes' => $plan->getTargetMinutes(),
        ], $plans);

        return $this->jsonSuccess([
            'plans' => $result,
            'periodType' => $periodType,
            'periodStart' => $periodStart->format('Y-m-d'),
        ]);
    }

    #[Route('', name: 'api_plans_upsert', methods: ['POST'])]
    public function upsert(Request $request)
    {
        $data = $this->parseJson($request);

        $categoryId = (int) ($data['categoryId'] ?? 0);
        $targetMinutes = max(0, (int) ($data['targetMinutes'] ?? 0));
        $periodType = $this->normalizePeriodType((string) ($data['periodType'] ?? Plan::PERIOD_DAY));
        $periodStart = $this->resolvePeriodStart($periodType, (string) ($data['periodStart'] ?? ''));

        $category = $this->categoryRepository->find($categoryId);
        if (!$category || $category->getUser()->getId() !== $this->currentUser()->getId()) {
            return $this->jsonError('Категория не найдена.', Response::HTTP_NOT_FOUND);
        }

        $plan = $this->planRepository->findOneBy([
            'user' => $this->currentUser(),
            'category' => $category,
            'periodType' => $periodType,
            'periodStart' => $periodStart,
        ]);

        if (!$plan) {
            $plan = (new Plan())
                ->setUser($this->currentUser())
                ->setCategory($category)
                ->setPeriodType($periodType)
                ->setPeriodStart($periodStart);

            $this->entityManager->persist($plan);
        }

        $plan->setTargetMinutes($targetMinutes);

        $this->entityManager->flush();

        return $this->jsonSuccess(['message' => 'План сохранен.']);
    }

    #[Route('/{id}', name: 'api_plans_delete', methods: ['DELETE'])]
    public function delete(int $id)
    {
        $plan = $this->planRepository->find($id);
        if (!$plan || $plan->getUser()->getId() !== $this->currentUser()->getId()) {
            return $this->jsonError('План не найден.', Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($plan);
        $this->entityManager->flush();

        return $this->jsonSuccess(['message' => 'План удален.']);
    }

    private function normalizePeriodType(string $periodType): string
    {
        return in_array($periodType, [Plan::PERIOD_DAY, Plan::PERIOD_WEEK], true) ? $periodType : Plan::PERIOD_DAY;
    }

    private function resolvePeriodStart(string $periodType, string $periodStart): \DateTimeImmutable
    {
        if ('' !== trim($periodStart)) {
            $date = \DateTimeImmutable::createFromFormat('Y-m-d', $periodStart);
            if ($date instanceof \DateTimeImmutable) {
                return Plan::PERIOD_WEEK === $periodType
                    ? $date->modify('monday this week')
                    : $date;
            }
        }

        $now = new \DateTimeImmutable();

        return Plan::PERIOD_WEEK === $periodType
            ? $now->modify('monday this week')
            : $now;
    }
}
