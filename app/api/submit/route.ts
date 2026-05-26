export async function POST(request: Request) {
  // Simulatar un pequeño retardo de red
  await new Promise((resolve) => setTimeout(resolve, 600))

  // 🔥 Simulación de error aleatorio (15%)
  const shouldFail = Math.random() < 0.15

  if (shouldFail) {
    return Response.json(
      {
        error: "Submission failed due to internal server error",
      },
      { status: 500 }
    )
  }

  return Response.json({ ok: true })
}
