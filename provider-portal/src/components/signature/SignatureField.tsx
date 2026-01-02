import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { KeenIcon } from '@/components';

interface SignatureFieldProps {
  label?: string;
  required?: boolean;
  onSignatureChange?: (signature: string | null) => void;
  disabled?: boolean;
  defaultValue?: string | null;
  width?: number;
  height?: number;
}

export interface SignatureFieldRef {
  clear: () => void;
  getSignature: () => string | null;
  isEmpty: () => boolean;
}

export const SignatureField = forwardRef<SignatureFieldRef, SignatureFieldProps>(
  (
    {
      label = 'Reporter Signature',
      required = false,
      onSignatureChange,
      disabled = false,
      defaultValue = null,
      width = 500,
      height = 200,
    },
    ref
  ) => {
    const sigPadRef = useRef<SignatureCanvas>(null);
    const [hasSignature, setHasSignature] = React.useState(!!defaultValue);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigPadRef.current?.clear();
        setHasSignature(false);
        onSignatureChange?.(null);
      },
      getSignature: () => {
        if (!sigPadRef.current || sigPadRef.current.isEmpty()) {
          return null;
        }
        return sigPadRef.current.toDataURL('image/png');
      },
      isEmpty: () => {
        return !sigPadRef.current || sigPadRef.current.isEmpty();
      },
    }));

    const handleClear = () => {
      sigPadRef.current?.clear();
      setHasSignature(false);
      onSignatureChange?.(null);
    };

    const handleEnd = () => {
      if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
        const signatureData = sigPadRef.current.toDataURL('image/png');
        setHasSignature(true);
        onSignatureChange?.(signatureData);
      }
    };

    return (
      <div className="signature-field">
        {label && (
          <label className="form-label text-gray-900 dark:text-gray-100">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </label>
        )}

        <div
          className={`signature-canvas-wrapper ${
            disabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div
            className="border-2 border-primary rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
            style={{ width: 'fit-content' }}
          >
            <SignatureCanvas
              ref={sigPadRef}
              canvasProps={{
                width: width,
                height: height,
                className: 'signature-canvas',
                style: { touchAction: 'none' },
              }}
              onEnd={handleEnd}
              backgroundColor="white"
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="btn btn-sm btn-light"
            >
              <KeenIcon icon="eraser" className="me-1" />
              Clear Signature
            </button>

            {hasSignature && (
              <span className="badge badge-success align-self-center">
                <KeenIcon icon="check-circle" className="me-1" />
                Signature captured
              </span>
            )}
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
          Draw your signature using your mouse or touchscreen in the box above.
        </p>
      </div>
    );
  }
);

SignatureField.displayName = 'SignatureField';