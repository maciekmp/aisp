import { useTranslation } from 'react-i18next'
import {
  Rocket,
  AlertTriangle,
  Drone,
  Settings,
  Video,
  Map,
  Compass,
  CheckCircle2,
  Zap,
  Navigation,
  BarChart3,
  SignalHigh,
  Archive,
  ClipboardCheck,
  Activity,
  ArchiveRestore
} from 'lucide-react'

export function Help() {
  const { t } = useTranslation()

  const getObjectsArray = <T,>(key: string) => {
    const value = t(key as any, { returnObjects: true }) as unknown
    return Array.isArray(value) ? (value as T[]) : []
  }

  const getArray = (key: string) => {
    const value = t(key as any, { returnObjects: true }) as unknown
    if (Array.isArray(value)) {
      return value as string[]
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return [value]
    }
    return []
  }

  const featureSections = [
    {
      id: 'overview',
      icon: Rocket,
      title: t('help.dashboard.sections.overview.title'),
      description: t('help.dashboard.sections.overview.description'),
      features: [
        {
          icon: Video,
          copy: t('help.dashboard.sections.overview.items.video')
        },
        {
          icon: Map,
          copy: t('help.dashboard.sections.overview.items.map')
        },
        {
          icon: Navigation,
          copy: t('help.dashboard.sections.overview.items.mode')
        }
      ],
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'telemetry',
      icon: SignalHigh,
      title: t('help.dashboard.sections.telemetry.title'),
      description: t('help.dashboard.sections.telemetry.description'),
      features: [
        {
          icon: CheckCircle2,
          copy: t('help.dashboard.sections.telemetry.items.tiles')
        },
        {
          icon: Compass,
          copy: t('help.dashboard.sections.telemetry.items.flight')
        },
        {
          icon: Zap,
          copy: t('help.dashboard.sections.telemetry.items.alerts')
        }
      ],
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'timeline',
      icon: AlertTriangle,
      title: t('help.dashboard.sections.timeline.title'),
      description: t('help.dashboard.sections.timeline.description'),
      features: [
        {
          icon: BarChart3,
          copy: t('help.dashboard.sections.timeline.items.progress')
        },
        {
          icon: Archive,
          copy: t('help.dashboard.sections.timeline.items.log')
        },
        {
          icon: AlertTriangle,
          copy: t('help.dashboard.sections.timeline.items.physics')
        }
      ],
      gradient: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      id: 'controls',
      icon: Drone,
      title: t('help.dashboard.sections.controls.title'),
      description: t('help.dashboard.sections.controls.description'),
      features: [
        {
          icon: Navigation,
          copy: t('help.dashboard.sections.controls.items.keyboard')
        },
        {
          icon: Settings,
          copy: t('help.dashboard.sections.controls.items.actions')
        },
        {
          icon: Drone,
          copy: t('help.dashboard.sections.controls.items.safety')
        }
      ],
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    }
  ]

  const quickstartCards = [
    {
      icon: Map,
      title: t('help.dashboard.quickstart.cards.layout.title'),
      description: t('help.dashboard.quickstart.cards.layout.description'),
      gradient: 'from-blue-400 to-cyan-400',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600'
    },
    {
      icon: Video,
      title: t('help.dashboard.quickstart.cards.video.title'),
      description: t('help.dashboard.quickstart.cards.video.description'),
      gradient: 'from-purple-400 to-pink-400',
      iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100',
      iconColor: 'text-purple-600'
    },
    {
      icon: Compass,
      title: t('help.dashboard.quickstart.cards.telemetry.title'),
      description: t('help.dashboard.quickstart.cards.telemetry.description'),
      gradient: 'from-green-400 to-emerald-400',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
      iconColor: 'text-emerald-600'
    },
  ]

  const manualTopics = getObjectsArray<{ title: string; description: string; steps?: string[] }>('help.manual.topics')
  const manualTopicIcons = [Video, Map, SignalHigh, Settings]

  const quickTips = getArray('help.dashboard.quickTips.items')

  const tocItems = [
    { id: 'overview', label: t('help.dashboard.sections.overview.title') },
    { id: 'telemetry', label: t('help.dashboard.sections.telemetry.title') },
    { id: 'timeline', label: t('help.dashboard.sections.timeline.title') },
    { id: 'controls', label: t('help.dashboard.sections.controls.title') },
    { id: 'quickstart', label: t('help.dashboard.quickstart.title') },
    { id: 'workflow-guides', label: t('help.dashboard.guides.title') },
    { id: 'operator-manual', label: t('help.manual.title') },
    { id: 'quick-tips', label: t('help.dashboard.quickTips.title') }
  ]

  const workflowGuides = [
    {
      icon: ClipboardCheck,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: t('help.dashboard.guides.preFlight.title'),
      description: t('help.dashboard.guides.preFlight.description'),
      steps: getArray('help.dashboard.guides.preFlight.steps')
    },
    {
      icon: Activity,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      title: t('help.dashboard.guides.onMission.title'),
      description: t('help.dashboard.guides.onMission.description'),
      steps: getArray('help.dashboard.guides.onMission.steps')
    },
    {
      icon: ArchiveRestore,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: t('help.dashboard.guides.postFlight.title'),
      description: t('help.dashboard.guides.postFlight.description'),
      steps: getArray('help.dashboard.guides.postFlight.steps')
    }
  ]

  const printStyles = `
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
      }

      nav {
        display: none !important;
      }

      body * {
        visibility: hidden !important;
      }

      #help-print-root,
      #help-print-root * {
        visibility: visible !important;
      }

      #help-print-root {
        position: static !important;
        overflow: visible !important;
        box-shadow: none !important;
        background: white !important;
      }

      #help-print-root .no-print-shadow {
        box-shadow: none !important;
      }

      #help-print-root .no-print-gradient {
        background-image: none !important;
        background-color: white !important;
      }

      #help-print-root .help-section {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      @page {
        margin: 12mm;
      }
    }
  `

  return (
    <>
      <style>{printStyles}</style>
      <div id="help-print-root" className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 print:bg-white">
        <div className="max-w-6xl mx-auto p-6 lg:p-8 print:px-0 print:py-4">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-6">
              <Rocket className="w-10 h-10 text-white print:text-black" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 print:text-gray-900 print:bg-none print:bg-clip-border">
              {t('help.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto print:text-base">
              {t('help.subtitle')}
            </p>
          </div>

          {/* Quick Navigation */}
          <nav aria-label={t('help.title')} className="mb-10 print:hidden">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {tocItems.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="px-4 py-2 rounded-full border border-blue-200 text-sm font-medium text-blue-700 bg-white/80 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Feature Sections */}
          <div className="space-y-6 mb-12">
            {featureSections.map((section, index) => {
              const Icon = section.icon
              return (
                <div
                  key={index}
                  id={section.id}
                  className={`help-section ${section.bgColor} rounded-2xl border-2 ${section.borderColor} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden print:border print:border-gray-300 print:bg-white print:shadow-none`}
                >
                  <div className="p-6 lg:p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`${section.iconBg} p-3 rounded-xl ${section.iconColor} flex-shrink-0 print:bg-gray-100`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                          {section.title}
                        </h2>
                        <p className="text-base text-gray-700 leading-relaxed">
                          {section.description}
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
                            <div className={`${section.iconBg} p-1.5 rounded-lg ${section.iconColor} flex-shrink-0 mt-0.5 print:bg-gray-100`}>
                              <FeatureIcon className="w-4 h-4" />
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed flex-1">
                              {feature.copy}
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

          {/* Quickstart Section */}
          <div id="quickstart" className="help-section bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-8 lg:p-10 print:shadow-none print:border print:border-gray-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {t('help.dashboard.quickstart.title')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full print:bg-gray-400 print:bg-none"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickstartCards.map((card, index) => {
                const CardIcon = card.icon
                return (
                  <div
                    key={index}
                    className="group relative p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className={`${card.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <CardIcon className={`w-7 h-7 ${card.iconColor} print:text-gray-800`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Workflow Guides */}
          <div id="workflow-guides" className="help-section mt-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {t('help.dashboard.guides.title')}
              </h2>
              <p className="text-base text-gray-600 max-w-3xl mx-auto">
                {t('help.dashboard.guides.intro')}
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {workflowGuides.map((guide, index) => {
                const GuideIcon = guide.icon
                return (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4 print:shadow-none print:border-gray-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${guide.iconBg} ${guide.iconColor} p-3 rounded-xl`}>
                        <GuideIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{guide.title}</h3>
                        <p className="text-sm text-gray-600">{guide.description}</p>
                      </div>
                    </div>
                    <ol className="space-y-3">
                      {guide.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-700 text-sm font-semibold flex-shrink-0 aspect-square">
                            {stepIndex + 1}
                          </span>
                          <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Operator Manual */}
          {manualTopics.length > 0 && (
            <div id="operator-manual" className="help-section mt-12 bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8 lg:p-10 print:shadow-none print:border print:border-gray-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {t('help.manual.title')}
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto">
                  {t('help.manual.intro')}
                </p>
              </div>
              <div className="space-y-8">
                {manualTopics.map((topic, index) => {
                  const TopicIcon = manualTopicIcons[index % manualTopicIcons.length]
                  return (
                    <div key={topic.title} className="flex flex-col gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                          <TopicIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-900">
                            {topic.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {topic.description}
                          </p>
                        </div>
                      </div>
                      {topic.steps && topic.steps.length > 0 && (
                        <ol className="space-y-3 ml-16">
                          {topic.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-purple-700 text-sm font-semibold flex-shrink-0 aspect-square">
                                {stepIndex + 1}
                              </span>
                              <span className="text-sm text-gray-700 leading-relaxed">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick Tips Section */}
          <div id="quick-tips" className="help-section mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl print:text-gray-900 print:bg-white print:border print:border-gray-300 print:shadow-none">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl flex-shrink-0 print:bg-gray-100">
                <Zap className="w-6 h-6 print:text-gray-900" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 print:text-gray-900">
                  {t('help.dashboard.quickTips.title')}
                </h3>
                <ul className="space-y-2 text-blue-50">
                  {quickTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 print:text-gray-700">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 print:text-gray-700" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 text-sm text-gray-500 text-center italic print:text-gray-600">
            {t('help.dashboard.printNote')}
          </div>
        </div>
      </div>
    </>
  )
}

