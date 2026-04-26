<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/categories')]
class CategoryController extends ApiController
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('', name: 'api_categories_list', methods: ['GET'])]
    public function list()
    {
        $items = array_map(
            static fn (Category $category): array => [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'color' => $category->getColor(),
                'isDefault' => $category->isDefault(),
            ],
            $this->categoryRepository->findByUser($this->currentUser())
        );

        return $this->jsonSuccess(['categories' => $items]);
    }

    #[Route('', name: 'api_categories_create', methods: ['POST'])]
    public function create(Request $request)
    {
        $data = $this->parseJson($request);
        $name = trim((string) ($data['name'] ?? ''));
        $color = strtoupper(trim((string) ($data['color'] ?? '#8B5CF6')));

        if ('' === $name) {
            return $this->jsonError('Название категории обязательно.');
        }

        if (!preg_match('/^#[0-9A-F]{6}$/', $color)) {
            return $this->jsonError('Цвет должен быть в формате HEX, например #8B5CF6.');
        }

        $existing = $this->categoryRepository->findOneBy([
            'user' => $this->currentUser(),
            'name' => $name,
        ]);

        if ($existing) {
            return $this->jsonError('Категория с таким именем уже существует.', Response::HTTP_CONFLICT);
        }

        $category = (new Category())
            ->setUser($this->currentUser())
            ->setName($name)
            ->setColor($color)
            ->setIsDefault(false);

        $this->entityManager->persist($category);
        $this->entityManager->flush();

        return $this->jsonSuccess([
            'message' => 'Категория создана.',
            'category' => [
                'id' => $category->getId(),
                'name' => $category->getName(),
                'color' => $category->getColor(),
                'isDefault' => $category->isDefault(),
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/{id}', name: 'api_categories_update', methods: ['PATCH'])]
    public function update(int $id, Request $request)
    {
        $category = $this->categoryRepository->find($id);
        if (!$category || $category->getUser()->getId() !== $this->currentUser()->getId()) {
            return $this->jsonError('Категория не найдена.', Response::HTTP_NOT_FOUND);
        }

        $data = $this->parseJson($request);

        if (isset($data['name'])) {
            $name = trim((string) $data['name']);
            if ('' !== $name) {
                $duplicate = $this->categoryRepository->findOneBy([
                    'user' => $this->currentUser(),
                    'name' => $name,
                ]);

                if ($duplicate && $duplicate->getId() !== $category->getId()) {
                    return $this->jsonError('Категория с таким именем уже существует.', Response::HTTP_CONFLICT);
                }

                $category->setName($name);
            }
        }

        if (isset($data['color'])) {
            $color = strtoupper(trim((string) $data['color']));
            if (!preg_match('/^#[0-9A-F]{6}$/', $color)) {
                return $this->jsonError('Некорректный цвет категории.');
            }
            $category->setColor($color);
        }

        $this->entityManager->flush();

        return $this->jsonSuccess(['message' => 'Категория обновлена.']);
    }

    #[Route('/{id}', name: 'api_categories_delete', methods: ['DELETE'])]
    public function delete(int $id)
    {
        $category = $this->categoryRepository->find($id);
        if (!$category || $category->getUser()->getId() !== $this->currentUser()->getId()) {
            return $this->jsonError('Категория не найдена.', Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($category);
        $this->entityManager->flush();

        return $this->jsonSuccess(['message' => 'Категория удалена.']);
    }
}
