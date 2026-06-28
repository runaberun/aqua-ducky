import { IOSDevice } from './ios/IOSDevice'
import { WaterApp } from './water/WaterApp'

export default function App() {
  return (
    <div className="page-shell">
      <IOSDevice>
        <WaterApp />
      </IOSDevice>
    </div>
  )
}
