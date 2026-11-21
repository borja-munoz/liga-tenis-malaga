import imgUrl from '/tennis-ball.svg';

export default function LoadingMessage() {
  return (
    <div
      role="status"
      aria-label="Cargando"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        className="zoom-in-out-box"
        style={{ backgroundImage: `url("${imgUrl}")` }}
      />
    </div>
  );
}
