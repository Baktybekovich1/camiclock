<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Entity\Category;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class AuthController extends ApiController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): Response
    {
        $data = $this->parseJson($request);

        $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');
        $firstName = trim((string) ($data['firstName'] ?? ''));
        $lastName = trim((string) ($data['lastName'] ?? ''));

        if ('' === $email || '' === $password || '' === $firstName || '' === $lastName) {
            return $this->jsonError('Заполните все обязательные поля.');
        }

        if (strlen($password) < 6) {
            return $this->jsonError('Пароль должен содержать минимум 6 символов.');
        }

        if ($this->userRepository->findOneBy(['email' => $email])) {
            return $this->jsonError('Пользователь с таким email уже существует.', Response::HTTP_CONFLICT);
        }

        $user = (new User())
            ->setEmail($email)
            ->setFirstName($firstName)
            ->setLastName($lastName)
            ->setRoles(['ROLE_USER'])
            ->setPassword('');

        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        $defaultCategories = [
            ['Чтение', '#8B5CF6'],
            ['Развитие', '#A855F7'],
            ['Соц. сети', '#C084FC'],
            ['Прогулки', '#7E22CE'],
            ['Сон', '#9333EA'],
        ];

        $this->entityManager->persist($user);

        foreach ($defaultCategories as [$name, $color]) {
            $category = (new Category())
                ->setUser($user)
                ->setName($name)
                ->setColor($color)
                ->setIsDefault(true);

            $this->entityManager->persist($category);
        }

        $this->entityManager->flush();

        return $this->jsonSuccess([
            'message' => 'Регистрация успешна. Теперь войдите в систему.',
        ], Response::HTTP_CREATED);
    }
}
