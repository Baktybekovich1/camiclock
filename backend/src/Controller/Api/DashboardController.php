<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Plan;
use App\Entity\TimerEntry;
use App\Repository\CategoryRepository;
use App\Repository\PlanRepository;
use App\Repository\TimerEntryRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/dashboard')]
class DashboardController extends ApiController
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository,
        private readonly TimerEntryRepository $timerEntryRepository,
        private readonly PlanRepository $planRepository,
    ) {
    }

    #[Route('/summary', name: 'api_dashboard_summary', methods: ['GET'])]
    public function summary(Request $request)
    {
        $periodType = (string) $request->query->get('periodType', Plan::PERIOD_DAY);
        if (!in_array($periodType, [Plan::PERIOD_DAY, Plan::PERIOD_WEEK], true)) {
            $periodType = Plan::PERIOD_DAY;
        }

        $periodStart = $this->resolvePeriodStart($periodType, (string) $request->query->get('periodStart', ''));
        $from = $periodStart->setTime(0, 0);
        $to = Plan::PERIOD_WEEK === $periodType ? $from->modify('+1 week') : $from->modify('+1 day');

        $categories = $this->categoryRepository->findByUser($this->currentUser());
        $entries = $this->timerEntryRepository->findByUserBetween($this->currentUser(), $from, $to);
        $plans = $this->planRepository->findByUserAndPeriod($this->currentUser(), $periodType, $periodStart);

        $spentByCategory = [];
        foreach ($entries as $entry) {
            $categoryId = $entry->getCategory()->getId();
            if (!$categoryId) {
                continue;
            }

            $spentByCategory[$categoryId] = ($spentByCategory[$categoryId] ?? 0) + $entry->getDurationSeconds();
        }

        $targetByCategory = [];
        foreach ($plans as $plan) {
            $categoryId = $plan->getCategory()->getId();
            if (!$categoryId) {
                continue;
            }

            $targetByCategory[$categoryId] = $plan->getTargetMinutes() * 60;
        }

        $categoriesSummary = [];
        $totalSpent = 0;
        $totalTarget = 0;

        foreach ($categories as $category) {
            $categoryId = $category->getId();
            if (!$categoryId) {
                continue;
            }

            $spent = $spentByCategory[$categoryId] ?? 0;
            $target = $targetByCategory[$categoryId] ?? 0;

            $totalSpent += $spent;
            $totalTarget += $target;

            $categoriesSummary[] = [
                'categoryId' => $categoryId,
                'name' => $category->getName(),
                'color' => $category->getColor(),
                'spentSeconds' => $spent,
                'targetSeconds' => $target,
                'gapSeconds' => $target - $spent,
                'progressPercent' => $target > 0 ? min(100, (int) round(($spent / $target) * 100)) : 0,
            ];
        }

        usort(
            $categoriesSummary,
            static fn (array $a, array $b): int => $b['spentSeconds'] <=> $a['spentSeconds']
        );

        $recentEntries = array_map(
            static fn (TimerEntry $entry): array => [
                'id' => $entry->getId(),
                'categoryName' => $entry->getCategory()->getName(),
                'categoryColor' => $entry->getCategory()->getColor(),
                'durationSeconds' => $entry->getDurationSeconds(),
                'startedAt' => $entry->getStartedAt()->format(DATE_ATOM),
            ],
            array_slice($entries, 0, 10)
        );

        return $this->jsonSuccess([
            'periodType' => $periodType,
            'periodStart' => $periodStart->format('Y-m-d'),
            'from' => $from->format(DATE_ATOM),
            'to' => $to->format(DATE_ATOM),
            'totalSpentSeconds' => $totalSpent,
            'totalTargetSeconds' => $totalTarget,
            'totalGapSeconds' => $totalTarget - $totalSpent,
            'categories' => $categoriesSummary,
            'recentEntries' => $recentEntries,
        ]);
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
