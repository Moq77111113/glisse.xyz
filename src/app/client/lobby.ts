function setupPinInputs() {
  const container = document.querySelector("[data-pin-container]")
  const form = document.getElementById("join-form") as HTMLFormElement
  const hiddenInput = document.getElementById("room-code-input") as HTMLInputElement

  if (!container || !form || !hiddenInput) return

  const inputs = Array.from(
    container.querySelectorAll<HTMLInputElement>("[data-pin-index]"),
  )

  const updateHiddenInput = () => {
    const code = inputs.map((i) => i.value).join("")
    hiddenInput.value = code
  }

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement
      let value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")

      if (value.length > 1) {
        value = value[0]
      }

      target.value = value
      updateHiddenInput()

      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus()
      }

      if (value && index === inputs.length - 1) {
        const code = inputs.map((i) => i.value).join("")
        if (code.length === 4) {
          form.submit()
        }
      }
    })

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        inputs[index - 1].focus()
      }
    })

    input.addEventListener("paste", (e) => {
      e.preventDefault()
      const paste = e.clipboardData?.getData("text") || ""
      const chars = paste.toUpperCase().replace(/[^A-Z0-9]/g, "").split("")

      chars.forEach((char, i) => {
        if (index + i < inputs.length) {
          inputs[index + i].value = char
        }
      })

      updateHiddenInput()

      const lastIndex = Math.min(index + chars.length, inputs.length - 1)
      inputs[lastIndex].focus()

      if (lastIndex === inputs.length - 1) {
        const code = inputs.map((i) => i.value).join("")
        if (code.length === 4) {
          setTimeout(() => {
            form.submit()
          }, 100)
        }
      }
    })
  })

  if (inputs[0]) {
    inputs[0].focus()
  }
}

document.addEventListener("DOMContentLoaded", setupPinInputs)
