export class IUser {
    id: string
    name: string
    parentId?: string
}

export class AddUserDto {
    name: string
    parentId?: string
}

export class SetParentDto {
    userId: string
    parentId?: string
}