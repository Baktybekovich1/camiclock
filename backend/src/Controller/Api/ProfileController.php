<?php

declare(strict_types=1);

namespace App\Controller\Api;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class ProfileController extends ApiController
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me()
    {
        $user = $this->currentUser();

        return $this->jsonSuccess([
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'roles' => $user->getRoles(),
                'isActive' => $user->isActive(),
                'createdAt' => $user->getCreatedAt()->format(DATE_ATOM),
            ],
        ]);
    }

    #[Route('/me', name: 'api_me_update', methods: ['PATCH'])]
    public function updateMe(Request $request)
    {
        $user = $this->currentUser();
        $data = $this->parseJson($request);

        if (isset($data['firstName'])) {
            $user->setFirstName((string) $data['firstName']);
        }

        if (isset($data['lastName'])) {
            $user->setLastName((string) $data['lastName']);
        }

        $this->entityManager->flush();

        return $this->jsonSuccess([
            'message' => 'Профиль обновлен.',
        ]);
    }
}
