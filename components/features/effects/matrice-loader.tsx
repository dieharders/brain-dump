import './matrice-loader.css'

export const InferenceLoadingSpinner = ({ theme }: { theme: string | undefined }) => {
  const styleName = theme === 'light' ? "matrice-square-loader-dark" : "matrice-square-loader-light"
  return <div className={styleName}></div>
}
