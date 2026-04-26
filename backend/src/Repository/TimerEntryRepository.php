<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\TimerEntry;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TimerEntry>
 */
class TimerEntryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TimerEntry::class);
    }

    public function findRunningForUser(User $user): ?TimerEntry
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.user = :user')
            ->andWhere('t.endedAt IS NULL')
            ->setParameter('user', $user)
            ->orderBy('t.startedAt', 'DESC')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /** @return TimerEntry[] */
    public function findByUserBetween(User $user, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        return $this->createQueryBuilder('t')
            ->andWhere('t.user = :user')
            ->andWhere('t.startedAt >= :from')
            ->andWhere('t.startedAt < :to')
            ->setParameter('user', $user)
            ->setParameter('from', $from)
            ->setParameter('to', $to)
            ->orderBy('t.startedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
