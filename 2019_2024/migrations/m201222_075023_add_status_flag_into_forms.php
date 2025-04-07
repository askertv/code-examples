<?php

use yii\db\Migration;

/**
 * Class m201222_075023_add_status_flag_into_forms
 */
class m201222_075023_add_status_flag_into_forms extends Migration
{
    const TABLE_NAME = 'forms';

    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->db->createCommand(
            'ALTER TABLE ' . self::TABLE_NAME . ' ADD status CHAR(1) NOT NULL DEFAULT "" AFTER event_id'
        )->execute();

        $this->db->createCommand(
            'ALTER TABLE ' . self::TABLE_NAME . ' ADD response TEXT AFTER status'
        )->execute();
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->db->createCommand('ALTER TABLE ' . self::TABLE_NAME . ' DROP status')->execute();
        $this->db->createCommand('ALTER TABLE ' . self::TABLE_NAME . ' DROP response')->execute();
    }
}
