<?php

namespace App\DataMapper;

use DomainObjectsCollection;
use MapperRegistry;

class UnitOfWork {
	private
		$cleanObjects,
		$newObjects,
		$dirtyObjects,
		$removedObjects;

	private static $instance;

	private function __construct() {
		$this->cleanObjects = new DomainObjectsCollection();
		$this->newObjects = new DomainObjectsCollection();
		$this->dirtyObjects = new DomainObjectsCollection();
		$this->removedObjects = new DomainObjectsCollection();
	}

	public static function getInstance() {
		if (!isset(self::$instance)) {
			self::$instance = new UnitOfWork();
		}
		return self::$instance;
	}

	public function registerNew($obj) {
		if ($obj->ID) {
			assert(!$this->cleanObjects->containsKey($obj->ID));
			assert(!$this->dirtyObjects->containsKey($obj->ID));
			assert(!$this->removedObjects->containsKey($obj->ID));
			assert(!$this->newObjects->containsKey($obj->ID));
		}
		$this->newObjects->add($obj);
	}

	public function registerDirty($obj) {
		assert($obj->ID);
		assert(!$this->removedObjects->containsKey($obj->ID));
		$this->cleanObjects->remove($obj->ID);

		if (
			!$this->dirtyObjects->containsKey($obj->ID)
			&&
			!$this->newObjects->containsKey($obj->ID)
		) {
			$this->dirtyObjects->put($obj->ID, $obj);
		}
	}

	public function registerClean($obj) {
		assert($obj->ID);
		assert(!$this->cleanObjects->containsKey($obj->ID));
		assert(!$this->dirtyObjects->containsKey($obj->ID));
		assert(!$this->removedObjects->containsKey($obj->ID));
		assert(!$this->newObjects->containsKey($obj->ID));
		$this->cleanObjects->put($obj->ID, $obj);
	}

	public function commit() {
		$this->insertNew();
		$this->updateDirty();
		$this->deleteRemoved();
	}

	public function insertNew() {
		for ($objects = $this->newObjects->iterator(); $objects->hasMore(); $objects->next()) {
			$object = $objects->current();
			MapperRegistry::getMapper($this->getClass($object))->insert($object);
		}
	}

	public function updateDirty() {
		for ($objects = $this->dirtyObjects->iterator(); $objects->hasMore(); $objects->next()) {
			$object = $objects->current();
			MapperRegistry::getMapper($this->getClass($object))->update($object);
		}
	}

	public function deleteRemoved() {
		for ($objects = $this->removedObjects->iterator(); $objects->hasMore(); $objects->next()) {
			$object = $objects->current();
			MapperRegistry::getMapper($this->getClass($object))->delete($object);
		}
	}

	private function getClass($obj) {
		$className = get_class($obj);
		$className = substr($className, strpos($className, '\\')+1, strlen($className));
		return substr($className, strpos($className, '\\')+1, strlen($className));
	}
}
?>
