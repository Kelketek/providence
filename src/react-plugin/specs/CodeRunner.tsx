export const CodeRunner = (params: {code: (() => any), renderResult?: boolean}) => {
  const result = params.code()
  if (params.renderResult) {
    return <>{JSON.stringify(result)}</>
  }
  return <></>
}