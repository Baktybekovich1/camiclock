<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\PlanRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PlanRepository::class)]
#[ORM\Table(name: 'plan')]
#[ORM\UniqueConstraint(name: 'uniq_plan_period_category', columns: ['user_id', 'category_id', 'period_type', 'period_start'])]
#[ORM\HasLifecycleCallbacks]
class Plan
{
    public const PERIOD_DAY = 'day';
    public const PERIOD_WEEK = 'week';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'plans')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'plans')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Category $category;

    #[ORM\Column(length: 10)]
    #[Assert\Choice(choices: [self::PERIOD_DAY, self::PERIOD_WEEK])]
    private string $periodType = self::PERIOD_DAY;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    private \DateTimeImmutable $periodStart;

    #[ORM\Column(options: ['default' => 0])]
    #[Assert\Range(min: 0, max: 10080)]
    private int $targetMinutes = 0;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getCategory(): Category
    {
        return $this->category;
    }

    public function setCategory(Category $category): self
    {
        $this->category = $category;

        return $this;
    }

    public function getPeriodType(): string
    {
        return $this->periodType;
    }

    public function setPeriodType(string $periodType): self
    {
        $this->periodType = $periodType;

        return $this;
    }

    public function getPeriodStart(): \DateTimeImmutable
    {
        return $this->periodStart;
    }

    public function setPeriodStart(\DateTimeImmutable $periodStart): self
    {
        $this->periodStart = $periodStart;

        return $this;
    }

    public function getTargetMinutes(): int
    {
        return $this->targetMinutes;
    }

    public function setTargetMinutes(int $targetMinutes): self
    {
        $this->targetMinutes = max(0, $targetMinutes);

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
}
