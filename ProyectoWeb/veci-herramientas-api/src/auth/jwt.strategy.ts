import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const keycloakUrl =
      configService.get<string>('KEYCLOAK_URL') ||
      'https://keycloak-production-51d6.up.railway.app';
    const realm = configService.get<string>('KEYCLOAK_REALM') || 'proyecto-dss';
    const issuer = `${keycloakUrl}/realms/${realm}`;
    const jwksUri = `${issuer}/protocol/openid-connect/certs`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      issuer,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const email = payload.email ?? `${payload.sub}@keycloak.local`;
    const name = payload.preferred_username ?? payload.name ?? email;

    const user = await this.usersService.findOrCreateByEmail(email, name);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
