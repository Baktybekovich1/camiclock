<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\TimerEntry;
use App\Repository\CategoryRepository;
use App\Repository\TimerEntryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/timers')]
class TimerController extends ApiController
{
    public function __construct(
        private readonly TimerEntryRepository $timerEntryRepository,
        private readonly CategoryRepository $categoryRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('/running', name: 'api_timer_running', methods: ['GET'])]
    public function running()
    {
        $entry = $this->timerEntryRepository->findRunningForUser($this->currentUser());

        if (!$entry) {
            return $this->jsonSuccess(['entry' => null]);
        }

        return $this->jsonSuccess([
            'entry' => [
                'id' => $entry->getId(),
                'categoryId' => $entry->getCategory()->getId(),
                'categoryName' => $entry->getCategory()->getName(),
                'categoryColor' => $entry->getCategory()->getColor(),
                'startedAt' => $entry->getStartedAt()->format(DATE_ATOM),
            ],
        ]);
    }

    #[Route('/start', name: 'api_timer_start', methods: ['POST'])]
    public function start(Request $request)
    {
        $data = $this->parseJson($request);
        $categoryId = (int) ($data['categoryId'] ?? 0);

        $category = $this->categoryRepository->find($categoryId);
        if (!$category || $category->getUser()->getId() !== $this->currentUser()->getId()) {
            return $this->jsonError('Категория не найдена.', Response::HTTP_NOT_FOUND);
        }

        $running = $this->timerEntryRepository->findRunningForUser($this->currentUser());
        if ($running) {
            return $this->jsonError('У вас уже запущен таймер. Сначала остановите его.', Response::HTTP_CONFLICT);
        }

        $entry = (new TimerEntry())
            ->setUser($this->currentUser())
            ->setCategory($category)
            ->setStartedAt(new \DateTimeImmutable())
            ->setDurationSeconds(0);

        $this->entityManager->persist($entry);
        $this->entityManager->flush();

        return $this->jsonSuccess([
            'message' => 'Таймер запущен.',
            'entryId' => $entry->getId(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/stop', name: 'api_timer_stop', methods: ['POST'])]
    public function stop()
    {
        $entry = $this->timerEntryRepository->findRunningForUser($this->currentUser());
        if (!$entry) {
            return $this->jsonError('Активный таймер не найден.', Response::HTTP_NOT_FOUND);
        }

        $endedAt = new \DateTimeImmutable();
        $duration = max(0, $endedAt->getTimestamp() - $entry->getStartedAt()->getTimestamp());

        $entry->setEndedAt($endedAt);
        $entry->setDurationSeconds($duration);

        $this->entityManager->flush();

        return $this->jsonSuccess([
            'message' => 'Таймер остановлен.',
            'durationSeconds' => $duration,
        ]);
    }

    #[Route('/manual', name: 'api_timer_manual', methods: ['POST'])]
    public function manual(Request $request)
    {
        $data = $this->parseJson($request);
        $categoryId = (int) ($data['categoryId'] ?? 0);
        $durationMinutes = (int) ($data['durationMinutes'] ?? 0);

        $category = $this->categoryRepository->find($categoryId);
        if (!$category || $category->getUser()->getId() !== $this->currentUser()->getId()) {
            return $this->jsonError('Категория не найдена.', Response::HTTP_NOT_FOUND);
        }

        if ($durationMinutes <= 0 || $durationMinutes > 1440) {
            return $this->jsonError('Укажите длительность от 1 до 1440 минут.');
        }

        $durationSeconds = $durationMinutes * 60;
        $endedAt = new \DateTimeImmutable();
        $startedAt = $endedAt->modify(sprintf('-%d seconds', $durationSeconds));

        $entry = (new TimerEntry())
            ->setUser($this->currentUser())
            ->setCategory($category)
            ->setStartedAt($startedAt)
            ->setEndedAt($endedAt)
            ->setDurationSeconds($durationSeconds);

        $this->entityManager->persist($entry);
        $this->entityManager->flush();

        return $this->jsonSuccess([
            'message' => 'Время добавлено вручную.',
            'entryId' => $entry->getId(),
            'durationSeconds' => $durationSeconds,
        ], Response::HTTP_CREATED);
    }

    #[Route('', name: 'api_timer_list', methods: ['GET'])]
    public function list(Request $request)
    {
        $period = (string) $request->query->get('period', 'day');
        $from = $this->buildPeriodStart($period);
        $to = $this->buildPeriodEnd($period, $from);

        $entries = $this->timerEntryRepository->findByUserBetween($this->currentUser(), $from, $to);

        $items = array_map(static fn (TimerEntry $entry): array => [
            'id' => $entry->getId(),
            'category' => [
                'id' => $entry->getCategory()->getId(),
                'name' => $entry->getCategory()->getName(),
                'color' => $entry->getCategory()->getColor(),
            ],
            'startedAt' => $entry->getStartedAt()->format(DATE_ATOM),
            'endedAt' => $entry->getEndedAt()?->format(DATE_ATOM),
            'durationSeconds' => $entry->getDurationSeconds(),
        ], $entries);

        return $this->jsonSuccess([
            'entries' => $items,
            'from' => $from->format(DATE_ATOM),
            'to' => $to->format(DATE_ATOM),
        ]);
    }

    private function buildPeriodStart(string $period): \DateTimeImmutable
    {
        $now = new \DateTimeImmutable();

        if ('week' === $period) {
            return $now->modify('monday this week')->setTime(0, 0);
        }

        return $now->setTime(0, 0);
    }

    private function buildPeriodEnd(string $period, \DateTimeImmutable $from): \DateTimeImmutable
    {
        if ('week' === $period) {
            return $from->modify('+1 week');
        }

        return $from->modify('+1 day');
    }
}
