import { Service, Inject } from 'typedi';

@Service()
export default class SmsService {
  constructor(@Inject('smsClient') private smsClient) {}

  public async SendVerifyCode(phonenumber: string) {
    // TODO -> send verify code
    return { delivered: 1, status: 'ok' };
  }
}
