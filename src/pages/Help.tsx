import { useTranslation } from 'react-i18next'
import { Rocket, MapPin, AlertTriangle, Drone, Archive, Settings, Video, Map, Compass, CheckCircle2, Zap, Navigation, BarChart3 } from 'lucide-react'

export function Help() {
  const { t } = useTranslation()

  const featureSections = [
    {
      icon: Rocket,
      titleKey: 'nav.missionControl',
      descKey: 'help.missionControl.desc',
      features: [
        { key: 'help.missionControl.realTimeMap', icon: Map },
        { key: 'help.missionControl.videoFeeds', icon: Video },
        { key: 'help.missionControl.telemetry', icon: Compass },
        { key: 'help.missionControl.manualMode', icon: Navigation },
        { key: 'help.missionControl.autoMode', icon: Zap },
        { key: 'help.missionControl.controls', icon: Settings },
      ],
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: MapPin,
      titleKey: 'nav.missionPlanner',
      descKey: 'help.missionPlanner.desc',
      features: [
        { key: 'help.missionPlanner.addWaypoints', icon: MapPin },
        { key: 'help.missionPlanner.editWaypoints', icon: Settings },
        { key: 'help.missionPlanner.timeline', icon: BarChart3 },
        { key: 'help.missionPlanner.saveRoute', icon: Archive },
      ],
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: AlertTriangle,
      titleKey: 'nav.alertCenter',
      descKey: 'help.alertCenter.desc',
      features: [
        { key: 'help.alertCenter.viewAlerts', icon: AlertTriangle },
        { key: 'help.alertCenter.filter', icon: Settings },
        { key: 'help.alertCenter.details', icon: Compass },
        { key: 'help.alertCenter.reports', icon: Archive },
      ],
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: Drone,
      titleKey: 'nav.fleet',
      descKey: 'help.fleet.desc',
      features: [
        { key: 'help.fleet.drones', icon: Drone },
        { key: 'help.fleet.dockingStations', icon: Archive },
        { key: 'help.fleet.status', icon: CheckCircle2 },
        { key: 'help.fleet.logs', icon: BarChart3 },
      ],
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Archive,
      titleKey: 'nav.archive',
      descKey: 'help.archive.desc',
      features: [
        { key: 'help.archive.viewMissions', icon: Archive },
        { key: 'help.archive.filter', icon: Settings },
        { key: 'help.archive.details', icon: Compass },
        { key: 'help.archive.download', icon: MapPin },
      ],
      gradient: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      icon: Settings,
      titleKey: 'nav.settings',
      descKey: 'help.settings.desc',
      features: [
        { key: 'help.settings.language', icon: Settings },
        { key: 'help.settings.preferences', icon: Settings },
      ],
      gradient: 'from-gray-500 to-slate-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
  ]

  const generalFeatures = [
    {
      icon: Map,
      titleKey: 'help.general.map',
      descKey: 'help.general.mapDesc',
      gradient: 'from-blue-400 to-cyan-400',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    },
    {
      icon: Video,
      titleKey: 'help.general.video',
      descKey: 'help.general.videoDesc',
      gradient: 'from-purple-400 to-pink-400',
      iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100',
    },
    {
      icon: Compass,
      titleKey: 'help.general.telemetry',
      descKey: 'help.general.telemetryDesc',
      gradient: 'from-green-400 to-emerald-400',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-6">
            <Rocket className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {t('help.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('help.subtitle')}
          </p>
        </div>

        {/* Feature Sections */}
        <div className="space-y-6 mb-12">
          {featureSections.map((section, index) => {
            const Icon = section.icon
            return (
              <div
                key={index}
                className={`${section.bgColor} rounded-2xl border-2 ${section.borderColor} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
              >
                <div className="p-6 lg:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`${section.iconBg} p-3 rounded-xl ${section.iconColor} flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {t(section.titleKey)}
                      </h2>
                      <p className="text-base text-gray-700 leading-relaxed">
                        {t(section.descKey)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-16">
                    {section.features.map((feature, featureIndex) => {
                      const FeatureIcon = feature.icon
                      return (
                        <div
                          key={featureIndex}
                          className="flex items-start gap-3 p-3 bg-white/70 rounded-lg hover:bg-white transition-colors"
                        >
                          <div className={`${section.iconBg} p-1.5 rounded-lg ${section.iconColor} flex-shrink-0 mt-0.5`}>
                            <FeatureIcon className="w-4 h-4" />
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed flex-1">
                            {t(feature.key)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* General Features Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 lg:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {t('help.general.title')}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generalFeatures.map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <div
                  key={index}
                  className="group relative p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`${feature.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <FeatureIcon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-xl flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">{t('help.quickTips.title')}</h3>
              <ul className="space-y-2 text-blue-50">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{t('help.quickTips.tip1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{t('help.quickTips.tip2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{t('help.quickTips.tip3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{t('help.quickTips.tip4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

