import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';
import {
    IErrors,
    IErrorsImport,
    IValidationErrorImport,
} from 'src/common/error/interfaces/error.interface';
import {
    IMessage,
    IMessageOptions,
} from 'src/common/message/interfaces/message.interface';
import { IMessageService } from 'src/common/message/interfaces/message.service.interface';

@Injectable()
export class MessageService implements IMessageService {
    private readonly appDefaultLanguage: string[];

    constructor(
        private readonly configService: ConfigService
    ) {
        this.appDefaultLanguage =
            this.configService.get<string[]>('app.language');
    }

    async getAvailableLanguages(): Promise<string[]> {
        return this.appDefaultLanguage;
    }

    async getRequestErrorsMessage(
        requestErrors: ValidationError[],
        customLanguages?: string[]
    ): Promise<IErrors[]> {
        const messages: Array<IErrors[]> = [];
        for (const transfomer of requestErrors) {
            let children: Record<string, any>[] = transfomer.children;
            let constraints: string[] = Object.keys(
                transfomer.constraints ?? []
            );
            const errors: IErrors[] = [];
            let property: string = transfomer.property;
            let propertyValue: string = transfomer.value;

            if (children.length > 0) {
                while (children.length > 0) {
                    for (const child of children) {
                        property = `${property}.${child.property}`;

                        if (child.children?.length > 0) {
                            children = child.children;
                            break;
                        } else if (child.constraints) {
                            constraints = Object.keys(child.constraints);
                            children = [];
                            propertyValue = child.value;
                            break;
                        }
                    }
                }
            }

            for (const constraint of constraints) {
                const message = `Error in ${property}: ${constraint}`;
                errors.push({
                    property,
                    message,
                });
            }

            messages.push(errors);
        }

        return messages.flat(1) as IErrors[];
    }

    async getImportErrorsMessage(
        errors: IValidationErrorImport[],
        customLanguages?: string[]
    ): Promise<IErrorsImport[]> {
        const newErrors: IErrorsImport[] = [];
        for (const error of errors) {
            newErrors.push({
                row: error.row,
                file: error.file,
                errors: await this.getRequestErrorsMessage(
                    error.errors,
                    customLanguages
                ),
            });
        }

        return newErrors;
    }

    async get<T = string>(key: string, options?: IMessageOptions): Promise<T> {
        return key as T;
    }
}
