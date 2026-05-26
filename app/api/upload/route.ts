export async function POST(request: Request) {
  // Simulatar un pequeño retardo de red
  await new Promise((resolve) => setTimeout(resolve, 800))

  // 🔥 Simulación de error aleatorio (20%)
  const shouldFail = Math.random() < 0.2

  if (shouldFail) {
    return Response.json(
      {
        error: "Upload failed due to network error",
      },
      { status: 500 }
    )
  }

  return Response.json({
    id: "123",
    url: "/uploads/file.png",
  })
}
