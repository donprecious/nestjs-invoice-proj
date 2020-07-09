export const responseStatus = {
  success: 'success',
  fail: 'failed',
};
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
}
