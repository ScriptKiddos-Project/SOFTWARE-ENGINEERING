// // client/src/components/ui/input.tsx

// import * as React from "react";
// // import { cn } from "@/utils";
// import { cn } from "../../../lib/utils";
// import { cva, type VariantProps } from "class-variance-authority";

// const inputVariants = cva(
//   "flex w-full rounded-md border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//   {
//     variants: {
//       variant: {
//         default: "border-input",
//         destructive: "border-red-500 focus-visible:ring-red-500",
//         success: "border-green-500 focus-visible:ring-green-500",
//         warning: "border-yellow-500 focus-visible:ring-yellow-500",
//       },
//       size: {
//         default: "h-10 px-3 py-2",
//         sm: "h-9 px-3",
//         lg: "h-11 px-4",
//         xl: "h-12 px-4 text-base",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

// export interface InputProps
//   extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
//     VariantProps<typeof inputVariants> {
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
//   error?: string;
//   helperText?: string;
// }

// const Input = React.forwardRef<HTMLInputElement, InputProps>(
//   ({ className, variant, size, leftIcon, rightIcon, error, helperText, type, ...props }, ref) => {
//     const hasError = !!error;
//     const finalVariant = hasError ? "destructive" : variant;

//     return (
//       <div className="w-full">
//         <div className="relative">
//           {leftIcon && (
//             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
//               {leftIcon}
//             </div>
//           )}
//           <input
//             type={type}
//             className={cn(
//               // coerce numeric sizes to allowed variant names if necessary
//               inputVariants({ variant: finalVariant, size: (typeof size === 'number' ? (size > 10 ? 'lg' : 'sm') : size) as any }),
//               leftIcon && "pl-10",
//               rightIcon && "pr-10",
//               className
//             )}
//             ref={ref}
//             {...props}
//           />
//           {rightIcon && (
//             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
//               {rightIcon}
//             </div>
//           )}
//         </div>
//         {(error || helperText) && (
//           <p className={cn(
//             "mt-1 text-xs",
//             hasError ? "text-red-500" : "text-muted-foreground"
//           )}>
//             {error || helperText}
//           </p>
//         )}
//       </div>
//     );
//   }
// );
// Input.displayName = "Input";

// // Textarea variant
// const Textarea = React.forwardRef<
//   HTMLTextAreaElement,
//   React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
//     error?: string;
//     helperText?: string;
//   }
// >(({ className, error, helperText, ...props }, ref) => {
//   const hasError = !!error;

//   return (
//     <div className="w-full">
//       <textarea
//         className={cn(
//           "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
//           hasError && "border-red-500 focus-visible:ring-red-500",
//           className
//         )}
//         ref={ref}
//         {...props}
//       />
//       {(error || helperText) && (
//         <p className={cn(
//           "mt-1 text-xs",
//           hasError ? "text-red-500" : "text-muted-foreground"
//         )}>
//           {error || helperText}
//         </p>
//       )}
//     </div>
//   );
// });
// Textarea.displayName = "Textarea";

// export { Input, Textarea, inputVariants };



// client/src/components/ui/input.tsx

import * as React from "react";
import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-md border bg-background text-foreground text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
  {
    variants: {
      variant: {
        default: "border-input",
        destructive: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 dark:border-green-600 focus-visible:ring-green-500 dark:focus-visible:ring-green-600",
        warning: "border-yellow-500 dark:border-yellow-600 focus-visible:ring-yellow-500 dark:focus-visible:ring-yellow-600",
      },
      inputSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-4",
        xl: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize, 
    leftIcon, 
    rightIcon, 
    error, 
    helperText, 
    type, 
    ...props 
  }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? "destructive" : variant;

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: finalVariant, inputSize }),
              leftIcon ? "pl-10" : null,
              rightIcon ? "pr-10" : null,
              className
            )}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            id={error ? `${props.id}-error` : `${props.id}-helper`}
            className={cn(
              "mt-1.5 text-xs",
              hasError ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea variant
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors",
            hasError && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        {(error || helperText) && (
          <p
            id={error ? `${props.id}-error` : `${props.id}-helper`}
            className={cn(
              "mt-1.5 text-xs",
              hasError ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea, inputVariants };