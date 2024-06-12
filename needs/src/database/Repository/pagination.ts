import { Model, FindAndCountOptions, Includeable, Order, ModelStatic } from 'sequelize';

interface PaginationQuery {
  limit?: number;
  page?: number;
}

interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const getPaginatedData = async <T extends Model>(
  model: ModelStatic<T>,
  options: {
    page?: number;
    limit?: number;
    where?: FindAndCountOptions['where'];
    include?: Includeable[];
    order?: Order;
  }
): Promise<PaginatedResult<T>> => {
  const { page = 1, limit = 10, where = {}, include = [], order = [] } = options;
  const offset = (page - 1) * limit;

  const { count, rows } = await model.findAndCountAll({
    where,
    include,
    order,
    limit,
    offset,
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    meta: {
      totalItems: count,
      itemCount: rows.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    },
  };
};
