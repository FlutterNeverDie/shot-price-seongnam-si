---
trigger: always_on
---

# 🤖 AI-Optimized React Architecture Rules (V1.0)

이 규칙은 AI(Cursor, Claude, GPT 등)가 코드를 생성할 때 문맥을 명확히 파악하고, 수정 시 사이드 이펙트를 최소화하기 위한 프로젝트 공통 설계 표준입니다.

---

## 1. 핵심 원칙: "작게 쪼개고, 경계를 세워라"
1. **파일당 책임은 하나**: 한 파일은 150라인을 넘기지 않도록 노력하며, UI와 비즈니스 로직은 반드시 분리한다.
2. **기능 중심 격리 (Feature-First)**: 공통 컴포넌트가 아닌 이상, 모든 코드는 특정 기능(`features/`) 폴더 내에 위치한다.
3. **타입 기반 개발**: 로직을 짜기 전 interface와 type을 먼저 정의하여 AI가 데이터 구조를 학습하게 한다.

---

## 2. 폴더 구조 명세 (Directory Rules)

```text
src/
├── api/             # 전역 API 클라이언트 및 에러 핸들링
├── components/      # 전역 공통 UI (Atomic Design의 Atom 단위)
│   └── common/      # 로직이 없는 순수 UI 컴포넌트 (Button, Badge 등)
├── features/        # 독립적인 기능 단위 (결합도 분리의 핵심)
│   └── [feature]/   # 예: search, price-list, reward-ad
│       ├── components/ # 해당 기능 내에서만 쓰이는 컴포넌트
│       ├── hooks/      # 비즈니스 로직, API 호출, 상태 관리 (핵심)
│       ├── types.ts    # 해당 기능 전용 타입
│       └── index.ts    # 외부로 노출할 요소만 export (캡슐화)
├── hooks/           # 프로젝트 전역 공통 훅 (useOverlay, useTDS 등)
├── store/           # 여러 기능이 공유하는 최소한의 전역 상태 (Zustand)
├── utils/           # 순수 함수 (포맷터, 계산 로직)
└── types/           # 전역 공유 타입 및 도메인 엔티티