export class PaginationQueryParam {
  page: number;

  limit: number;
  constructor() {
    this.page = 1;
    this.limit = 20;
  }
}

export class PaginatedResultDto {
  data: any[];
  page: number;
  limit: number;
  totalCount: number;
}
