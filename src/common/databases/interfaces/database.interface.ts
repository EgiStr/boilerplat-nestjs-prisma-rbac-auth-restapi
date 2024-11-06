import { IPaginationOptions } from 'src/common/pagination/interfaces/pagination.interface';

// find one
export interface IDatabaseFindOneOptions
    extends Pick<IPaginationOptions, 'orderBy'> {
    select?: Record<string, any>;
    include?: never;
    distinct?: never;
    cursor?: never;
}

export type IDatabaseOptions = Pick<IDatabaseFindOneOptions, 'include'>;

// find
export interface IDatabaseFindAllOptions
    extends IPaginationOptions,
        Omit<IDatabaseFindOneOptions, 'orderBy'> {}

// create

export interface IDatabaseCreateOptions extends IDatabaseFindOneOptions {
    id?: string;
}

// exist

export interface IDatabaseExistOptions extends IDatabaseOptions {
    excludeId?: string[];
}

// bulk
export type IDatabaseManyOptions = Pick<IDatabaseFindOneOptions, 'include'>;

export type IDatabaseCreateManyOptions = IDatabaseOptions;

export type IDatabaseSoftDeleteManyOptions = IDatabaseManyOptions;

export type IDatabaseRestoreManyOptions = IDatabaseManyOptions;

export type IDatabaseRawOptions = IDatabaseOptions;
