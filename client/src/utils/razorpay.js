const RAZORPAY_SCRIPT =
  "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise = null;

export const loadRazorpay = () => {
  if (
    typeof window !== "undefined" &&
    window.Razorpay
  ) {
    return Promise.resolve(true);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise =
    new Promise((resolve) => {
      const existingScript =
        document.querySelector(
          `script[src="${RAZORPAY_SCRIPT}"]`,
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
          { once: true },
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
          { once: true },
        );

        return;
      }

      const script =
        document.createElement(
          "script",
        );

      script.src =
        RAZORPAY_SCRIPT;

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script,
      );
    });

  return scriptPromise;
};