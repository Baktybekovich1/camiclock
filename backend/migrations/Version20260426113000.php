<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260426113000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create users, categories, timer entries and plans tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE app_user (id SERIAL NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, first_name VARCHAR(80) NOT NULL, last_name VARCHAR(80) NOT NULL, is_active BOOLEAN DEFAULT TRUE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_FC3F24BDE7927C74 ON app_user (email)');

        $this->addSql('CREATE TABLE category (id SERIAL NOT NULL, user_id INT NOT NULL, name VARCHAR(60) NOT NULL, color VARCHAR(7) NOT NULL, is_default BOOLEAN DEFAULT FALSE NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_64C19C1DA76ED395 ON category (user_id)');
        $this->addSql('CREATE UNIQUE INDEX uniq_category_user_name ON category (user_id, name)');

        $this->addSql('CREATE TABLE timer_entry (id SERIAL NOT NULL, user_id INT NOT NULL, category_id INT NOT NULL, started_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, ended_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, duration_seconds INT DEFAULT 0 NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_71051CEEA76ED395 ON timer_entry (user_id)');
        $this->addSql('CREATE INDEX IDX_71051CEE12469DE2 ON timer_entry (category_id)');

        $this->addSql('CREATE TABLE plan (id SERIAL NOT NULL, user_id INT NOT NULL, category_id INT NOT NULL, period_type VARCHAR(10) NOT NULL, period_start DATE NOT NULL, target_minutes INT DEFAULT 0 NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D263E43EA76ED395 ON plan (user_id)');
        $this->addSql('CREATE INDEX IDX_D263E43E12469DE2 ON plan (category_id)');
        $this->addSql('CREATE UNIQUE INDEX uniq_plan_period_category ON plan (user_id, category_id, period_type, period_start)');

        $this->addSql('ALTER TABLE category ADD CONSTRAINT FK_64C19C1DA76ED395 FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE timer_entry ADD CONSTRAINT FK_71051CEEA76ED395 FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE timer_entry ADD CONSTRAINT FK_71051CEE12469DE2 FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE plan ADD CONSTRAINT FK_D263E43EA76ED395 FOREIGN KEY (user_id) REFERENCES app_user (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE plan ADD CONSTRAINT FK_D263E43E12469DE2 FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE timer_entry DROP CONSTRAINT FK_71051CEEA76ED395');
        $this->addSql('ALTER TABLE timer_entry DROP CONSTRAINT FK_71051CEE12469DE2');
        $this->addSql('ALTER TABLE category DROP CONSTRAINT FK_64C19C1DA76ED395');
        $this->addSql('ALTER TABLE plan DROP CONSTRAINT FK_D263E43EA76ED395');
        $this->addSql('ALTER TABLE plan DROP CONSTRAINT FK_D263E43E12469DE2');

        $this->addSql('DROP TABLE timer_entry');
        $this->addSql('DROP TABLE plan');
        $this->addSql('DROP TABLE category');
        $this->addSql('DROP TABLE app_user');
    }
}
