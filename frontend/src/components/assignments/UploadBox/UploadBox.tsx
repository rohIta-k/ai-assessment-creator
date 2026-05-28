import { useState } from 'react'
import { X } from 'lucide-react'
import { useAssignmentStore } from '../../../store/assignmentStore'

export function UploadBox() {
  const { form, setUploadName, setUploadDataUrl } = useAssignmentStore()

  const [showError, setShowError] = useState(false)
  const preview = form.uploadDataUrl || null

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png']

    if (!allowedTypes.includes(file.type)) {
      setShowError(true)
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) {
        return
      }

      setUploadName(file.name)
      setUploadDataUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const removePreview = () => {
    setUploadName('')
    setUploadDataUrl('')
  }

  return (
    <>
      <label className="group relative grid h-[202px] max-w-[746px] cursor-pointer place-items-center overflow-hidden rounded-[20px] border-[1.75px] border-dashed border-[#00000033] bg-white/80 text-center transition hover:border-[#00000055] max-lg:h-[200px] max-lg:rounded-[16px] max-lg:bg-[#f6f6f6]">
        <input
          type="file"
          accept=".jpeg,.jpg,.png"
          className="sr-only"
          onChange={handleFileChange}
        />

        {preview ? (
          <>
              <div className="absolute inset-0 flex items-center justify-center bg-white p-[12px]">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  removePreview()
                }}
                className="absolute right-[16px] top-[16px] z-10 grid h-[32px] w-[32px] place-items-center rounded-full bg-black/60 text-white backdrop-blur"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </>
            ) : (
            <span className="grid place-items-center px-[32px] py-[24px]">
              <span className="mb-[18px] grid h-[40px] w-[40px] place-items-center rounded-[8px]">
                <img
                  src="/upload.svg"
                  alt=""
                  className="h-[24px] w-[24px]"
                />
              </span>

              <span className="max-h-[22px] text-[16px] font-medium text-primary">
                {form.uploadName || 'Choose a file or drag & drop it here'}
              </span>

              <span className="mt-[7px] text-[14px] font-normal text-[#a9a9a9]">
                JPEG, PNG, upto 10MB
              </span>

              <span className="mt-[18px] max-h-[36px] max-w-[127px] rounded-full bg-[#ffffff] px-[24px] py-[8px] text-[14px] font-medium leading-[140%] tracking-[-0.04em] text-primary transition group-hover:bg-[#eeeeee]">
                Browse Files
              </span>
            </span>
        )}
          </label>

        {showError ? (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-[20px]">
            <div className="w-full max-w-[360px] rounded-[20px] bg-white p-[24px]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[18px] font-semibold text-primary">
                    Invalid File
                  </h3>

                  <p className="mt-[8px] text-[14px] text-[#777]">
                    Please upload only JPEG or PNG files.
                  </p>
                </div>

                <button
                  onClick={() => setShowError(false)}
                  className="grid h-[28px] w-[28px] place-items-center rounded-full hover:bg-[#f2f2f2]"
                >
                  <X className="h-[16px] w-[16px]" />
                </button>
              </div>

              <button
                onClick={() => setShowError(false)}
                className="mt-[20px] h-[42px] w-full rounded-full bg-black text-[14px] font-medium text-white"
              >
                Okay
              </button>
            </div>
          </div>
        ) : null}
      </>
      )
}