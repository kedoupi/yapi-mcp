export interface YApiConfig {
  baseUrl: string;
  projectToken: string;
  projectId?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  cacheTtl?: number;
}

export interface YApiProject {
  _id: number;
  name: string;
  basepath: string;
  desc: string;
  env: Array<{
    name: string;
    domain: string;
  }>;
}

export interface YApiCategory {
  _id: number;
  name: string;
  project_id: number;
  desc: string;
  uid: number;
}

export interface YApiInterface {
  _id: number;
  title: string;
  path: string;
  method: string;
  project_id: number;
  catid: number;
  status: string;
  desc: string;
  req_body_type?: string;
  req_body_form?: any[];
  req_body_other?: string;
  req_headers?: Array<{
    name: string;
    value: string;
    desc: string;
    required: string;
  }>;
  req_params?: Array<{
    name: string;
    desc: string;
    required: string;
  }>;
  req_query?: Array<{
    name: string;
    value: string;
    desc: string;
    required: string;
  }>;
  res_body?: string;
  res_body_type?: string;
  username: string;
  uid: number;
  add_time: number;
  up_time: number;
}

export interface YApiResponse<T = any> {
  errcode: number;
  errmsg: string;
  data: T;
}

export interface SearchApiParams {
  project_id?: number;
  catid?: number;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CreateApiParams {
  title: string;
  path: string;
  method: string;
  project_id: number;
  catid: number;
  desc?: string;
  req_body_type?: string;
  req_body_other?: string;
  res_body?: string;
  res_body_type?: string;
  status?: string;
}

export interface UpdateApiParams extends CreateApiParams {
  id: number;
}