export const formatMoney = (val: number) => {
  if (!val) {
    return 'R$ 0,00'
  }

  if (val === -1) {
    return '--,--'
  }

  return val.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}