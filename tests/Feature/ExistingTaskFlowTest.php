<?php

declare(strict_types=1);

use App\Models\Task;

it('preserves the existing task flow after the framework upgrade', function (): void {
    $this->get('/')->assertOk();
    $this->post('/tasks', ['title' => 'Compatibility check'])->assertRedirect('/');
    $task = Task::query()->sole();

    $this->get("/tasks/{$task->id}/edit")->assertOk();
    $this->put("/tasks/{$task->id}", [
        'title' => 'Updated task',
        'description' => 'Existing Blade flow',
    ])->assertRedirect('/');
    expect($task->refresh()->title)->toBe('Updated task');

    $this->patch("/tasks/{$task->id}/toggle")->assertRedirect('/');
    expect($task->refresh()->is_done)->toBeTrue();

    $this->delete("/tasks/{$task->id}")->assertRedirect('/');
    $this->assertDatabaseCount('tasks', 0);
});
