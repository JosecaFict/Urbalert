import Badge from '../common/Badge'
import { estadoStyle } from '../../utils/statusColors'

interface Props {
  estado: string
}

export default function ReclamoStatusBadge({ estado }: Props) {
  const style = estadoStyle(estado)
  return (
    <Badge className={`${style.bg} ${style.text}`} dot={style.dot}>
      {estado}
    </Badge>
  )
}
