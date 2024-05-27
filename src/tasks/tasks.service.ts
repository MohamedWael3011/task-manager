import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksFilterDto } from './dtos/filter-task.dto';
import { CreateTaskDto } from './dtos/create-task.dto';
import { Task, TaskStatus, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private databaseRepository: PrismaService) {}

  async getTasks(filterDto: TasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const tasks = await this.databaseRepository.task.findMany({
      where: {
        userId: user.id,
        AND: [
          status ? { status } : {},
          search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { description: { contains: search, mode: 'insensitive' } }
                ]
              }
            : {}
        ]
      }
    });

    return tasks;
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.databaseRepository.task.findUnique({
      where: { id, userId: user.id }
    });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = await this.databaseRepository.task.create({
      data: {
        title,
        description,
        status: TaskStatus.TODO,
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    return task;
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const deleteResult = await this.databaseRepository.task.deleteMany({
      where: {
        id,
        userId: user.id
      }
    });

    if (deleteResult.count === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    status: TaskStatus,
    user: User
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    await this.databaseRepository.task.update({
      where: { id: task.id },
      data: { status }
    });

    return { ...task, status };
  }
}
