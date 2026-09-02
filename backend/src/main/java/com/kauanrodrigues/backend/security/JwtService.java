package com.kauanrodrigues.backend.security;

import com.kauanrodrigues.backend.model.UserModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder encoder;

    private final long expiration;


    public JwtService(JwtEncoder encoder, @Value("${skillkids.jwt.expiration}") long expiration) {
        this.encoder = encoder;
        this.expiration = expiration;
    }

    public String generateToken(UserModel user) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiration))
                .claim("role", user.getRole().getRoleName().name())
                .build();

        JwsHeader header = JwsHeader.
                with(MacAlgorithm.HS256)
                .build();

        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public Long getExpiration() {
        return expiration;
    }

}
