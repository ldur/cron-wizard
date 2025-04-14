
import { useState, useEffect } from "react";
import { CalendarCheck, ArrowRight, Check, X, Code, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CronJob } from "@/types/CronJob";
import { convertToCron, parseSchedule } from "@/utils/cronParser";
import { ScheduleGroup } from "@/services/scheduleGroupService";
import { useQuery } from "@tanstack/react-query";
import { fetchScheduleGroups } from "@/services/scheduleGroupService";

interface CronJobFormProps {
  job?: CronJob;
  onSubmit: (job: Omit<CronJob, 'id' | 'nextRun'>) => void;
  onCancel: () => void;
}

const CronJobForm = ({ job, onSubmit, onCancel }: CronJobFormProps) => {
  const [name, setName] = useState(job?.name || '');
  const [command, setCommand] = useState(job?.command || '');
  const [naturalLanguage, setNaturalLanguage] = useState('');
  const [cronExpression, setCronExpression] = useState(job?.cronExpression || '0 * * * *');
  const [minutes, setMinutes] = useState<string>('0');
  const [hours, setHours] = useState<string>('*');
  const [dayOfMonth, setDayOfMonth] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');
  const [activeTab, setActiveTab] = useState<string>("natural");
  const [humanReadable, setHumanReadable] = useState<string>('Every hour');
  const [schedulePreview, setSchedulePreview] = useState<string[]>([]);
  const [isApi, setIsApi] = useState<boolean>(job?.isApi || false);
  const [endpointName, setEndpointName] = useState<string>(job?.endpointName || '');
  const [iacCode, setIacCode] = useState<string>(job?.iacCode || '');
  const [targetTab, setTargetTab] = useState<string>("basic");
  const [groupId, setGroupId] = useState<string | null>(job?.groupId || null);

  // Fetch schedule groups
  const { data: groups = [] } = useQuery({
    queryKey: ['scheduleGroups'],
    queryFn: fetchScheduleGroups,
  });

  // This effect only runs once when the component mounts or when the job prop changes
  useEffect(() => {
    if (job?.cronExpression) {
      const parts = job.cronExpression.split(' ');
      if (parts.length === 5) {
        setMinutes(parts[0]);
        setHours(parts[1]);
        setDayOfMonth(parts[2]);
        setMonth(parts[3]);
        setDayOfWeek(parts[4]);
      }
    }
  }, [job]);

  // Update cron expression when individual parts change
  useEffect(() => {
    const newCronExpression = `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setCronExpression(newCronExpression);
    
    // Update human readable description
    const readable = parseSchedule(newCronExpression);
    setHumanReadable(readable);
    
    // Generate next run times
    generateNextRunTimes(newCronExpression);
  }, [minutes, hours, dayOfMonth, month, dayOfWeek]);

  const handleNaturalLanguageChange = (input: string) => {
    setNaturalLanguage(input);
  };

  const handleNaturalLanguageProcess = () => {
    if (!naturalLanguage.trim()) return;
    
    try {
      const cron = convertToCron(naturalLanguage);
      if (cron) {
        const parts = cron.split(' ');
        if (parts.length === 5) {
          setMinutes(parts[0]);
          setHours(parts[1]);
          setDayOfMonth(parts[2]);
          setMonth(parts[3]);
          setDayOfWeek(parts[4]);
          setCronExpression(cron);
          
          // Update human readable description
          const readable = parseSchedule(cron);
          setHumanReadable(readable);
          
          // Generate next run times
          generateNextRunTimes(cron);
        }
      }
    } catch (error) {
      console.log("Could not parse natural language:", error);
    }
  };

  // Add a keydown handler for the Enter key to process natural language input
  const handleNaturalLanguageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNaturalLanguageProcess();
    }
  };

  const generateNextRunTimes = (cronExp: string) => {
    // This is a simplified preview generator
    // In a real application, you'd use a library like cron-parser
    const now = new Date();
    const nextRuns: string[] = [];
    
    // Just add placeholder dates for the UI preview
    for (let i = 1; i <= 3; i++) {
      const nextDate = new Date(now.getTime() + (i * 60 * 60 * 1000)); // add hours
      nextRuns.push(nextDate.toLocaleString());
    }
    
    setSchedulePreview(nextRuns);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we're in natural language tab and there's input, process it before submitting
    if (activeTab === "natural" && naturalLanguage.trim()) {
      handleNaturalLanguageProcess();
    }
    
    onSubmit({
      name,
      command,
      cronExpression,
      status: job?.status || 'active',
      isApi,
      endpointName,
      iacCode,
      groupId
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{job ? 'Edit Cron Job' : 'Create New Cron Job'}</CardTitle>
          <CardDescription>
            Schedule your job using natural language or cron expression
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={targetTab} onValueChange={setTargetTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Job Name</Label>
                <Input
                  id="name"
                  placeholder="Daily Database Backup"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="command">Command / URL</Label>
                <Input
                  id="command"
                  placeholder="https://api.example.com/backup"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupId">Schedule Group</Label>
                <Select value={groupId || ''} onValueChange={(value) => setGroupId(value === '' ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Group similar jobs together for better organization
                </p>
              </div>

              <div className="space-y-2">
                <Label>Schedule</Label>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="natural">Natural Language</TabsTrigger>
                    <TabsTrigger value="builder">Expression Builder</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="natural" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          className="natural-language-input flex-grow"
                          placeholder="Every day at 3am"
                          value={naturalLanguage}
                          onChange={(e) => handleNaturalLanguageChange(e.target.value)}
                          onKeyDown={handleNaturalLanguageKeyDown}
                        />
                        <Button 
                          type="button" 
                          onClick={handleNaturalLanguageProcess}
                          variant="secondary"
                        >
                          Parse
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Examples: "every hour", "every day at 2pm", "every Monday at 9am"
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="builder" className="space-y-4 pt-4">
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <Label htmlFor="minutes" className="text-xs">Minute</Label>
                        <Input
                          id="minutes"
                          value={minutes}
                          onChange={(e) => setMinutes(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hours" className="text-xs">Hour</Label>
                        <Input
                          id="hours"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dayOfMonth" className="text-xs">Day (Month)</Label>
                        <Input
                          id="dayOfMonth"
                          value={dayOfMonth}
                          onChange={(e) => setDayOfMonth(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="month" className="text-xs">Month</Label>
                        <Input
                          id="month"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dayOfWeek" className="text-xs">Day (Week)</Label>
                        <Input
                          id="dayOfWeek"
                          value={dayOfWeek}
                          onChange={(e) => setDayOfWeek(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Common values: * (any), */5 (every 5), 1-5 (range), 1,3,5 (list)</p>
                    </div>
                    <div className="pt-2">
                      <Label className="text-xs">Cron Expression</Label>
                      <div className="bg-muted p-2 rounded text-sm font-mono mt-1">
                        {cronExpression}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="bg-accent/10 rounded-md p-4 space-y-2">
                <div className="flex items-center text-sm font-medium">
                  <CalendarCheck className="h-4 w-4 mr-2 text-accent" />
                  Schedule Summary
                </div>
                <p className="text-sm">{humanReadable}</p>
                
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-medium">Next executions:</p>
                  <ul className="space-y-1">
                    {schedulePreview.map((time, index) => (
                      <li key={index} className="text-xs flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1 text-muted-foreground" />
                        {time}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div>
                  <Label htmlFor="target-type" className="text-base font-medium">Target Type</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between API endpoint or Lambda function
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="is-api" className={isApi ? "text-blue-500" : "text-muted-foreground"}>
                    {isApi ? "API" : "Lambda"}
                  </Label>
                  <Switch
                    id="is-api"
                    checked={isApi}
                    onCheckedChange={setIsApi}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endpoint-name">
                  {isApi ? "API Endpoint URL" : "Lambda Function Name"}
                </Label>
                <div className="flex items-center space-x-2">
                  {isApi ? (
                    <Globe className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Code className="h-4 w-4 text-amber-500" />
                  )}
                  <Input
                    id="endpoint-name"
                    placeholder={isApi ? "https://api.example.com/endpoint" : "my-lambda-function"}
                    value={endpointName}
                    onChange={(e) => setEndpointName(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isApi ? "The full URL to the API endpoint" : "The name of the AWS Lambda function to invoke"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="iac-code">Infrastructure as Code</Label>
                <Textarea
                  id="iac-code"
                  placeholder="// TypeScript code for AWS infrastructure"
                  value={iacCode}
                  onChange={(e) => setIacCode(e.target.value)}
                  className="font-mono h-40"
                />
                <p className="text-xs text-muted-foreground">
                  TypeScript code for implementing the API or Lambda in AWS
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Check className="h-4 w-4 mr-2" />
            {job ? 'Update Job' : 'Create Job'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CronJobForm;
