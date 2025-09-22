// Presence/STOMP 상수 모음
// - 엔드포인트/토픽/타이밍을 한곳에서 관리하여 재사용성과 가시성 향상
// - 실서비스에서 튜닝이 필요한 값은 여기만 고치면 전체에 반영

// 웹소켓 엔드포인트
export const WS_BASE_URL = "ws://192.168.0.7:8080/ws";
// export const WS_BASE_URL = "ws://222.234.4.177:8080/ws"; 

// 서버로 publish 할 때 사용하는 토믹 경로를 한곳에 정의
export const PUB = {
    CONNECT: "/app/connect",
    SNAPSHOT: "/app/presence/snapshot",
    UPDATE: "/app/update",
    PING: "/app/ping",
    WORKING: "/app/working"
};

// 서버로부터 subscribe 하는 user-queue 경로
// subscribe topic
export const SUB = {
    SNAPSHOT: "/user/queue/presence", // 최초 연결 직후 받는 전체 스냅샷
    EVENTS: "/user/queue/events" // 추가 이벤트(다른 유저 조인/업데이트/리브/워킹 변경)
};

// 타이밍/리트라이/하트비트 등 모든 시간 관련 상수
export const TIMING = {
    reconnectDelay: 5000, // 재연결 대기(ms). STOMP Client의 reconnectDelay
    heartbeatIncoming: 10000, // 브로커 > 클라이언트 하트비트(ms)
    heartbeatOutgoing: 10000, // 클라이언트 > 브로커 하트비트(ms)
    pingInterval: 5000, // 주기적 ping 퍼블리시 간격(ms)
    snapshotDelay: 300, // 초기 연결 직후 스냅샷 요청 지연(ms)
    publishRetryBaseMs: 150, // 연결 미완료 시 퍼블리시 재시도 기본 지연(ms)
    publishRetryMaxAttempts: 3, // 퍼블리시 최대 재시도 횟수
    publishRetryOnErrorBaseMs: 200, // 퍼블리시 실패(예외) 시 재시도 기본 지연(ms)
};