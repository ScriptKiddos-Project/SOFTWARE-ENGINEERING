// // client/src/components/ui/button.tsx

// import * as React from "react";
// import { Slot } from "@radix-ui/react-slot";
// import { cva, type VariantProps } from "class-variance-authority";
// // import { cn } from "@/utils";
// import { cn } from "../../../lib/utils";


// const buttonVariants = cva(
//   "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
//   {
//     variants: {
//       variant: {
//         default: "bg-primary text-primary-foreground hover:bg-primary/90",
//         destructive:
//           "bg-destructive text-destructive-foreground hover:bg-destructive/90",
//         outline:
//           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
//         secondary:
//           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
//         ghost: "hover:bg-accent hover:text-accent-foreground",
//         link: "text-primary underline-offset-4 hover:underline",
//         success: "bg-success-500 text-white hover:bg-success-600",
//         warning: "bg-warning-500 text-white hover:bg-warning-600",
//         gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90",
//       },
//       size: {
//         default: "h-10 px-4 py-2",
//         sm: "h-9 rounded-md px-3",
//         lg: "h-11 rounded-md px-8",
//         xl: "h-12 rounded-md px-10 text-base",
//         icon: "h-10 w-10",
//         "icon-sm": "h-8 w-8",
//         "icon-lg": "h-12 w-12",
//       },
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default",
//     },
//   }
// );

// export interface ButtonProps
//   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
//     VariantProps<typeof buttonVariants> {
//   asChild?: boolean;
//   // allow 'as' passthrough for components that render as a different element
//   as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
//   loading?: boolean;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
// }

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//   ({ 
//     className, 
//     variant, 
//     size, 
//     asChild = false, 
//     loading = false,
//     leftIcon,
//     rightIcon,
//     children,
//     disabled,
//     ...props 
//   }, ref) => {
//     const Comp = asChild ? Slot : "button";
    
//     const isDisabled = disabled || loading;
    
//     return (
//       <Comp
//         className={cn(buttonVariants({ variant, size, className }))}
//         ref={ref}
//         disabled={isDisabled}
//         {...props}
//       >
//         {loading && (
//           <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//         )}
//         {!loading && leftIcon && (
//           <span className="mr-2">{leftIcon}</span>
//         )}
//         {children}
//         {!loading && rightIcon && (
//           <span className="ml-2">{rightIcon}</span>
//         )}
//       </Comp>
//     );
//   }
// );
// Button.displayName = "Button";

// export { Button, buttonVariants };


// client/src/components/ui/button.tsx

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-background dark:hover:bg-accent dark:hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline dark:text-primary",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700",
        warning: "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700",
        gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 dark:from-primary dark:to-secondary dark:hover:from-primary/90 dark:hover:to-secondary/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };