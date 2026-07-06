# Security Notes

## 현재 적용한 보안 기준

- 의존성 취약점은 `npm audit --audit-level=moderate`로 확인합니다.
- Firebase Hosting 배포 시 `/saju/**`에 보안 헤더를 자동 병합합니다.
- 공유 링크는 이름을 기본 제외하고, 출생 정보만 URL에 포함합니다.
- 저장된 사주 정보는 서버가 아니라 브라우저 `localStorage`에만 저장합니다.
- 사용자가 브라우저 저장 정보를 전체 삭제할 수 있습니다.
- 이름 입력은 제어문자, 꺾쇠 문자, 과도한 길이를 정리합니다.

## 공개 전 확인

- Firebase Admin SDK 서비스 계정 JSON은 저장소에 올리지 않습니다.
- `.env`, 개인키, 토큰, 서비스 계정 파일은 커밋하지 않습니다.
- 공유 링크에는 생년월일시가 포함되므로 공용 채널에 올릴 때 주의 문구를 유지합니다.
- 건강, 투자, 결혼, 법률, 진로 판단은 참고용 콘텐츠임을 고지합니다.

## Firebase Hosting 보안 헤더

GitHub Actions가 `saegim-card/firebase.json`에 다음 성격의 헤더를 병합합니다.

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- 정적 asset 장기 캐시
- `index.html` no-store
