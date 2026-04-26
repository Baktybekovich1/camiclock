<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/users')]
class AdminController extends ApiController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('', name: 'api_admin_users_list', methods: ['GET'])]
    public function list()
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $users = $this->userRepository->findBy([], ['createdAt' => 'DESC']);

        $items = array_map(static fn (User $user): array => [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'roles' => $user->getRoles(),
            'isActive' => $user->isActive(),
            'createdAt' => $user->getCreatedAt()->format(DATE_ATOM),
        ], $users);

        return $this->jsonSuccess(['users' => $items]);
    }

    #[Route('/{id}', name: 'api_admin_users_update', methods: ['PATCH'])]
    public function update(int $id, Request $request)
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->jsonError('Пользователь не найден.', Response::HTTP_NOT_FOUND);
        }

        $data = $this->parseJson($request);

        if (isset($data['isActive'])) {
            $user->setIsActive((bool) $data['isActive']);
        }

        if (isset($data['roles']) && is_array($data['roles'])) {
            $roles = array_values(array_filter($data['roles'], static fn ($role): bool => is_string($role) && str_starts_with($role, 'ROLE_')));
            if ([] === $roles) {
                $roles = ['ROLE_USER'];
            }

            $user->setRoles($roles);
        }

        $this->entityManager->flush();

        return $this->jsonSuccess(['message' => 'Пользователь обновлен.']);
    }
}
