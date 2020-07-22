import { HttpStatus } from '@nestjs/common';

export const responseStatus = {
  success: 'success',
  fail: 'failed',
};
export enum AppErrorCode {
  ERROR = 'ERROR',
  Duplicate = 'DUPLICATE_VALUES',
  Existing = 'EXISTING_VALUES',
  NOT_EXISTING = 'NOT_EXISTING',
}

export class AppResponse {
  static OkSuccess(obj: object, message = '') {
    const res = {
      data: obj,
      message: message,
      status: responseStatus.success,
    };
    return res;
  }
  static OkFailure(message = '', code = '') {
    const res = {
      code: code,
      message: message,
      status: responseStatus.fail,
    };
    return res;
  }
  static NotFound(message = '') {
    const res = {
      message: message,
      status: responseStatus.fail,
    };
    return res;
  }

  static badRequest(
    errors,
    message = '',
    code: AppErrorCode = AppErrorCode.ERROR,
  ) {
    return {
      status: HttpStatus.BAD_REQUEST,
      error: errors,
      message: message,
      code: code,
    };
  }
}
