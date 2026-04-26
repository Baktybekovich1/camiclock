<?php

declare(strict_types=1);

namespace App\Controller\Api;

use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class AboutController extends ApiController
{
    #[Route('/about', name: 'api_about', methods: ['GET'])]
    public function index()
    {
        return $this->jsonSuccess([
            'app' => 'CamiClock',
            'description' => 'Умный трекер времени с категориями, таймером, планами на день и неделю, аналитикой и админкой.',
            'version' => '1.0.0',
        ]);
    }
}
