import './matrice-loader.css'

export const MatriceLoadingSpinner = ({ theme }: { theme: string | undefined }) => {
  const styleName = theme === 'light' ? 'matrice-square-loader-dark' : 'matrice-square-loader-light'
  return <div className={styleName}></div>
}
