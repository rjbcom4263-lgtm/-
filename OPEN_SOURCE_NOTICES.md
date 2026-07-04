# Open Source Notices

이 프로젝트는 사주/만세력 계산과 웹 UI 구현을 위해 아래 오픈소스 패키지를 사용한다.

## Runtime Dependencies

### manseryeok

- Package: `manseryeok`
- License: MIT
- Repository: https://github.com/yhj1024/manseryeok
- Use: 기준 만세력 계산 엔진. 사주팔자, 십성, 공망, 대운 등 기본 명식 산출에 사용한다.

### ssaju

- Package: `ssaju`
- License: MIT
- Repository: https://github.com/golbin/ssaju
- Use: 비교/보강 엔진. 신살, 합충형파해, 격국, 용신, 세운, 월운 등 확장 항목의 기준 비교에 사용한다.

### React

- Package: `react`, `react-dom`
- License: MIT
- Repository: https://github.com/facebook/react
- Use: 웹 UI 구현.

### lucide-react

- Package: `lucide-react`
- License: ISC
- Repository: https://github.com/lucide-icons/lucide
- Use: UI 아이콘.

## Policy

- 오픈소스 라이브러리의 저작권 및 라이선스 고지를 유지한다.
- 계산 결과가 라이브러리별로 다를 경우 `manseryeok`를 기준 명식 엔진으로 두고, `ssaju`는 비교/보강 엔진으로 사용한다.
- 신살, 용신, 격국 등 관법 차이가 큰 항목은 비교 리포트와 테스트를 통해 프로젝트 기준을 별도 기록한다.
- 사용자에게 제공되는 운세/해석은 참고용이며, 중요한 의사결정의 유일한 근거로 사용하지 않도록 안내한다.
