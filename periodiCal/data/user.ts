import { v4 as uuidv4 } from 'uuid';

export class User {
    private _id: string;
    private _name: string;
    private _age: number;
    private _weight: number;

    public constructor(name: string, age: number, weight: number) {
        this._id = uuidv4();
        this._name = name;
        this._age = age;
        this._weight = weight;
    }

    public get id(): string {
        return this._id;
    }

    public set id(value: string) {
        this._id = value;
    }

     public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }

     public get age(): number {
        return this._age;
    }
    public set age(value: number) {
        this._age = value;
    }

    public get weight(): number {
        return this._weight;
    }

    public set weight(value: number) {
        this._weight = value;
    }

}