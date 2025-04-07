<?php

use yii\db\Migration;

class m190614_120741_forms extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->createTable('forms', [
            'id' => $this->primaryKey(),
            'type' => $this->string(255)->notNull(),
            'update_date' => $this->timestamp(),
            'create_date' => $this->timestamp()->defaultExpression('CURRENT_TIMESTAMP'),
            'name' => $this->string(255),
            'phone' => $this->string(255),
            'email' => $this->string(255),
            'position' => $this->string(255),
            'company' => $this->string(255),
            'captcha' => $this->string(255),
            'agreement' => $this->string(255),
            'url' => $this->string(255),
            'query' => $this->string(255),
            'cookies' => $this->string(255),
            'd_code' => $this->string(255),
            'p_sector' => $this->string(255),
            'product' => $this->string(255),
            'question' => $this->string(255),
            'event_name' => $this->string(255),
            'event_id' => $this->string(255),
        ]);
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropTable('forms');
    }
}
