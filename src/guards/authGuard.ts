import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const b64auth = (request.headers.authorization || '').split(' ')[1] || '';
    const [username, password] = Buffer.from(b64auth, 'base64')
      .toString()
      .split(':');
    if (
      username === process.env.API_ACCESS_SSIT_DISCORD_BOT_NAME &&
      password === process.env.API_ACCESS_SSIT_DISCORD_BOT_KEY
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export default AuthGuard;
