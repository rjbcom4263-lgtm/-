# 사주팔자 만세력 MVP

만세력 계산 결과를 일반 사용자가 읽을 수 있는 문서형 사주 풀이로 보여주는 React/Vite 기반 MVP입니다.

## 주요 기능

- 생년월일시 기반 사주팔자 계산
- 음력/윤달 입력과 자시 기준 옵션
- 사주팔자 표, 십성, 지장간, 12운성, 12신살, 길성/신살
- 합충형파해, 오행 분포, 신강/신약, 격국, 용신 후보
- 핵심 요약 3줄과 문서형 사주 풀이
- 직업운, 재물운, 관계운, 생활/건강운 조건별 조언팩
- 프로필 저장, 공유 링크, PDF 저장용 인쇄 버튼
- 50개 샘플 문장 품질 보고서

## 실행

```bash
npm.cmd install
npm.cmd run dev
```

빌드:

```bash
npm.cmd run build
```

테스트:

```bash
npm.cmd test
```

문서형 풀이 샘플 보고서 재생성:

```bash
npx.cmd tsx scripts/audit-saju-document.ts
```

엔진 비교 보고서 재생성:

```bash
npm.cmd run audit:engine
```

## 기준 문서

- `ENGINE_ROADMAP.md`: 엔진 개발 단계
- `ENGINE_DECISIONS.md`: 계산 기준 결정
- `ENGINE_VALIDATION_REPORT.md`: 엔진 검증 보고서
- `ENGINE_COMPARISON_AUTOMATED_REPORT.md`: 우리 엔진과 `ssaju` 보조 엔진 자동 비교 보고서
- `SAJU_DOCUMENT_SAMPLE_REPORT.md`: 문서형 풀이 50개 샘플 보고서
- `SERVICE_READINESS_CHECKLIST.md`: 서비스 출시 전 체크리스트

## 주의

이 서비스는 참고용 사주 콘텐츠입니다. 건강, 투자, 결혼, 법률, 진로를 확정적으로 판단하지 않으며 중요한 결정은 현실 자료와 전문가 상담을 함께 확인해야 합니다.
