import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Brain,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-6">
            Stark Industries
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-4">
            Advanced Financial Analytics & AI-Powered Forecasting
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <Zap className="h-4 w-4 mr-2" />
            Powered by Arc Reactor Technology
          </Badge>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 hover:border-blue-400">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <BarChart3 className="h-6 w-6 text-blue-600 group-hover:text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Dashboard Analytics</CardTitle>
                  <CardDescription>Real-time financial insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Centralized department-wide view with stunning metrics cards, real-time revenue tracking, and budget allocation insights.
              </p>
              <Link href="/dashboard">
                <Button className="w-full group-hover:bg-blue-600">
                  Open Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-purple-200 hover:border-purple-400">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Brain className="h-6 w-6 text-purple-600 group-hover:text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Forecasting</CardTitle>
                  <CardDescription>Intelligent predictions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Advanced AI-powered forecasting with OpenAI integration, revenue growth patterns, and confidence scoring.
              </p>
              <Link href="/analytics">
                <Button variant="outline" className="w-full group-hover:border-purple-500 group-hover:text-purple-600">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-green-200 hover:border-green-400">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <AlertTriangle className="h-6 w-6 text-green-600 group-hover:text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Smart Alerts</CardTitle>
                  <CardDescription>Risk monitoring system</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Real-time notifications for budget overruns, revenue drops, and risk threshold monitoring with custom dismissal.
              </p>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full group-hover:border-green-500 group-hover:text-green-600">
                  Monitor Alerts
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Key Features */}
        <div className="bg-white/50 dark:bg-gray-900/50 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-8">Advanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Export & Reporting</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate JSON reports, dashboard snapshots, and meeting-ready visual summaries with automated timestamps.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Trend Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI-powered trend identification, growth pattern analysis, and strategic recommendations for business optimization.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Risk Assessment</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive risk analysis with department-specific insights and proactive threat identification.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">OpenAI Integration</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Cutting-edge AI models for data cleaning, forecast generation, and intelligent business insights.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Financial Analytics?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Experience the power of AI-driven financial intelligence
          </p>
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Launch Dashboard
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2">
                View AI Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
