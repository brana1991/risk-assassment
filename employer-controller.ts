import { Employer } from './employer';
import { AppDataSource } from "../../app-data-source"
import { Entity } from 'typeorm'

Entity
export class UserController {
    getAll() {
        return AppDataSource.manager.find(Employer)
    }
}