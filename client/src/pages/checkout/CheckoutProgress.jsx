import { Check } from "lucide-react";

export default function CheckoutProgress({ currentStep = 1, dark = true }) {
  const steps = [
    {
      id: 1,
      label: "Cart",
    },
    {
      id: 2,
      label: "Address",
    },
    {
      id: 3,
      label: "Payment",
    },
    {
      id: 4,
      label: "Done",
    },
  ];

  return (
    <div className="w-full flex items-center justify-center mb-12 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;

          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              {/* STEP */}
              <div className="flex items-center gap-3">
                {/* Circle */}
                <div
                  className={`
                    relative
                    w-10 h-10
                    rounded-full
                    flex items-center justify-center
                    text-[13px]
                    font-black
                    transition-all duration-500
                    ${
                      isActive
                        ? `
                          bg-[#ff3c00]
                          text-white
                          scale-110
                          shadow-[0_0_30px_rgba(255,60,0,0.55)]
                        `
                        : isCompleted
                          ? `
                          bg-emerald-500
                          text-white
                        `
                          : dark
                            ? `
                          bg-white/8
                          text-white/30
                        `
                            : `
                          bg-black/8
                          text-gray-400
                        `
                    }
                  `}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}

                  {/* Glow */}
                  {isActive && (
                    <div
                      className="
                        absolute inset-0 rounded-full
                        animate-ping
                        bg-[#ff3c00]/20
                      "
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[12px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    transition-all duration-300
                    whitespace-nowrap
                    ${
                      isActive
                        ? dark
                          ? "text-white"
                          : "text-black"
                        : isCompleted
                          ? "text-emerald-500"
                          : dark
                            ? "text-white/25"
                            : "text-gray-400"
                    }
                  `}
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {step.label}
                </span>
              </div>

              {/* LINE */}
              {index !== steps.length - 1 && (
                <div
                  className={`
                    w-16 sm:w-24 h-[1px] mx-4
                    transition-all duration-500
                    ${
                      currentStep > step.id
                        ? "bg-emerald-500"
                        : dark
                          ? "bg-white/10"
                          : "bg-black/10"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
